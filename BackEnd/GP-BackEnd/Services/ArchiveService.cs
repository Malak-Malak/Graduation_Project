using GP_BackEnd.Data;
using GP_BackEnd.DTOs.Archive;
using GP_BackEnd.DTOs.Requirement;
using GP_BackEnd.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Net.Http.Json;
using System.Text.Json;

namespace GP_BackEnd.Services
{
    public class ArchiveService
    {
        private readonly ApplicationDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly string _openAiApiKey;

        public ArchiveService(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public ArchiveService(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _httpClient = new HttpClient();
            _openAiApiKey = config["OpenAI:ApiKey"];
        }

        

        // ── Student submits project ───────────────────────────────────────────
        public async Task<(bool success, string message)> SubmitProjectAsync(int studentId, int version)
        {
            var teamMember = await _context.TeamMembers
                .Include(tm => tm.Team)
                .FirstOrDefaultAsync(tm => tm.UserId == studentId
                    && tm.Team.Status == "Active");

            if (teamMember == null)
                return (false, "You are not in an active team.");

            var team = teamMember.Team;

            if (version == 0 && team.IsSubmittedV0)
                return (false, "Your team has already submitted Phase 1.");
            if (version == 1 && team.IsSubmittedV1)
                return (false, "Your team has already submitted Phase 2.");
            if (version == 0 && team.IsArchivedV0)
                return (false, "Phase 1 has already been archived.");
            if (version == 1 && team.IsArchivedV1)
                return (false, "Phase 2 has already been archived.");

            if (version == 0) team.IsSubmittedV0 = true;
            else team.IsSubmittedV1 = true;

            _context.Notifications.Add(new Notification
            {
                Title = "Project Submitted",
                Message = $"Team '{team.ProjectTitle}' has submitted Phase {version + 1} for review.",
                CreatedAt = DateTime.UtcNow,
                UserId = team.SupervisorId
            });

            await _context.SaveChangesAsync();
            return (true, $"Phase {version + 1} submitted for supervisor review.");
        }

        // ── Supervisor gets submitted teams ───────────────────────────────────
        public async Task<List<SubmittedTeamDto>> GetSubmittedTeamsAsync(int supervisorId)
        {
            var teams = await _context.Teams
                .Include(t => t.TeamMembers)
                    .ThenInclude(tm => tm.User)
                        .ThenInclude(u => u.UserProfile)
                .Include(t => t.Supervisor)
                    .ThenInclude(s => s.UserProfile)
                .Include(t => t.Project)
                .Where(t => t.SupervisorId == supervisorId
                    && ((t.IsSubmittedV0 && !t.IsArchivedV0)
                     || (t.IsSubmittedV1 && !t.IsArchivedV1)))
                .ToListAsync();

            var result = new List<SubmittedTeamDto>();

            foreach (var t in teams)
            {
                var supervisorName = t.Supervisor.UserProfile != null
                    ? t.Supervisor.UserProfile.FullName
                    : t.Supervisor.Username;

                var memberNames = t.TeamMembers
                    .Select(tm => tm.User.UserProfile != null
                        ? tm.User.UserProfile.FullName
                        : tm.User.Username)
                    .ToList();

                if (t.IsSubmittedV0 && !t.IsArchivedV0)
                    result.Add(new SubmittedTeamDto
                    {
                        TeamId = t.Id,
                        ProjectName = t.ProjectTitle,
                        ProjectDescription = t.Project != null ? t.Project.Description : "",
                        SupervisorName = supervisorName,
                        GithubRepo = t.GithubRepo,
                        MemberNames = memberNames,
                        Version = 0
                    });

                if (t.IsSubmittedV1 && !t.IsArchivedV1)
                    result.Add(new SubmittedTeamDto
                    {
                        TeamId = t.Id,
                        ProjectName = t.ProjectTitle,
                        ProjectDescription = t.Project != null ? t.Project.Description : "",
                        SupervisorName = supervisorName,
                        GithubRepo = t.GithubRepo,
                        MemberNames = memberNames,
                        Version = 1
                    });
            }

            return result;
        }

        // ── Supervisor gets team files for a specific version ─────────────────
        public async Task<(bool success, string message, List<TeamFileDto>? files)>
            GetTeamFilesForVersionAsync(int supervisorId, int teamId, int version)
        {
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == teamId && t.SupervisorId == supervisorId);

            if (team == null)
                return (false, "Team not found or does not belong to you.", null);

            var files = await _context.ProjectFiles
                .Include(f => f.User)
                    .ThenInclude(u => u.UserProfile)
                .Where(f => f.TeamId == teamId
                    && f.Version == version
                    && f.UserId != supervisorId)
                .OrderByDescending(f => f.UploadedAt)
                .Select(f => new TeamFileDto
                {
                    Id = f.Id,
                    FileName = f.FileName,
                    FilePath = f.FilePath,
                    Description = f.Description,
                    UploadedByName = f.User.UserProfile != null
                        ? f.User.UserProfile.FullName
                        : f.User.Username,
                    UploadedAt = f.UploadedAt
                })
                .ToListAsync();

            return (true, "OK", files);
        }

        // ── Supervisor sends to archive ───────────────────────────────────────
        public async Task<(bool success, string message)> SendToArchiveAsync(
            int supervisorId, SendToArchiveDto dto)
        {
            if (dto.FileIds == null || !dto.FileIds.Any())
                return (false, "You must select at least one file to archive.");

            var team = await _context.Teams
                .Include(t => t.TeamMembers)
                .Include(t => t.Requirements)
                .FirstOrDefaultAsync(t => t.Id == dto.TeamId
                    && t.SupervisorId == supervisorId);

            if (team == null)
                return (false, "Team not found or does not belong to you.");

            if (dto.Version == 0 && !team.IsSubmittedV0)
                return (false, "Phase 1 has not been submitted.");
            if (dto.Version == 1 && !team.IsSubmittedV1)
                return (false, "Phase 2 has not been submitted.");
            if (dto.Version == 0 && team.IsArchivedV0)
                return (false, "Phase 1 has already been archived.");
            if (dto.Version == 1 && team.IsArchivedV1)
                return (false, "Phase 2 has already been archived.");

            // Validate selected files belong to this team and version
            var selectedFiles = await _context.ProjectFiles
                .Where(f => dto.FileIds.Contains(f.Id)
                    && f.TeamId == dto.TeamId
                    && f.Version == dto.Version
                    && f.UserId != supervisorId)
                .ToListAsync();

            if (!selectedFiles.Any())
                return (false, "None of the selected files are valid for this team and version.");

            // Save archived files
            foreach (var file in selectedFiles)
            {
                _context.ArchivedFiles.Add(new ArchivedFile
                {
                    TeamId = dto.TeamId,
                    Version = dto.Version,
                    FileName = file.FileName,
                    FilePath = file.FilePath,
                    Description = file.Description
                });
            }

            // Clean up versioned data
            var tasks = await _context.TaskItems
                .Where(ti => ti.TeamId == dto.TeamId && ti.Version == dto.Version)
                .ToListAsync();
            _context.TaskItems.RemoveRange(tasks);

            var feedbacks = await _context.Feedbacks
                .Where(f => f.TeamId == dto.TeamId && f.Version == dto.Version)
                .ToListAsync();
            _context.Feedbacks.RemoveRange(feedbacks);

            var reports = await _context.TeamProgressReports
                .Where(r => r.TeamId == dto.TeamId && r.Version == dto.Version)
                .ToListAsync();
            _context.TeamProgressReports.RemoveRange(reports);

            // Clean up notifications for team members
            var memberIds = team.TeamMembers.Select(tm => tm.UserId).ToList();
            var notifications = await _context.Notifications
                .Where(n => memberIds.Contains(n.UserId))
                .ToListAsync();
            _context.Notifications.RemoveRange(notifications);

            // Mark this version as archived
            if (dto.Version == 0)
            {
                team.IsArchivedV0 = true;
                team.ArchivedAtV0 = DateTime.UtcNow;
                team.IsSubmittedV0 = false;
            }
            else
            {
                team.IsArchivedV1 = true;
                team.ArchivedAtV1 = DateTime.UtcNow;
                team.IsSubmittedV1 = false;
            }

            // Notify team members
            foreach (var member in team.TeamMembers)
            {
                _context.Notifications.Add(new Notification
                {
                    Title = "Project Archived",
                    Message = $"Phase {dto.Version + 1} of your project '{team.ProjectTitle}' has been archived.",
                    CreatedAt = DateTime.UtcNow,
                    UserId = member.UserId
                });
            }

            await _context.SaveChangesAsync();
            return (true, $"Phase {dto.Version + 1} archived successfully.");
        }

        // Smart AI-powered search through archived projects
        public async Task<List<ArchiveCardDto>> SearchArchivedProjectsAsync(string userDescription)
        {
            // Get all archived projects
            var allProjects = await GetArchivedProjectsAsync();

            if (!allProjects.Any())
                return new List<ArchiveCardDto>();

            // Build a summary of all projects to send to OpenAI
            var projectSummaries = allProjects.Select((p, index) =>
                $"[{index}] Title: {p.ProjectName} | Description: {p.ProjectDescription}");

            var projectList = string.Join("\n", projectSummaries);

            var prompt = $@"A student described their project idea as follows:
""{userDescription}""

Below is a list of archived projects. Return ONLY the indices (numbers in brackets) of projects that are similar to the student's idea, ranked from most similar to least similar. Consider semantic similarity, not just keyword matching. If no projects are similar, return an empty list.

Archived projects:
{projectList}

Respond ONLY with a JSON array of indices, e.g: [2, 5, 0] or [] if none match. No explanation, no text, just the JSON array.";

            try
            {
                var requestBody = new
                {
                    model = "gpt-3.5-turbo",
                    messages = new[]
                    {
                new { role = "user", content = prompt }
            },
                    max_tokens = 100
                };

                var request = new HttpRequestMessage(
                    HttpMethod.Post,
                    "https://api.openai.com/v1/chat/completions");

                request.Headers.Add("Authorization", $"Bearer {_openAiApiKey}");
                request.Content = JsonContent.Create(requestBody);

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                    return new List<ArchiveCardDto>();

                var json = await response.Content.ReadFromJsonAsync<JsonElement>();
                var rawText = json
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString() ?? "[]";

                // Parse the indices array
                var indices = JsonSerializer.Deserialize<List<int>>(rawText.Trim());

                if (indices == null || !indices.Any())
                    return new List<ArchiveCardDto>();

                // Return matched projects in ranked order
                return indices
                    .Where(i => i >= 0 && i < allProjects.Count)
                    .Select(i => allProjects[i])
                    .ToList();
            }
            catch
            {
                // Fallback: basic keyword search if OpenAI fails
                return allProjects
                    .Where(p =>
                        p.ProjectName.Contains(userDescription, StringComparison.OrdinalIgnoreCase) ||
                        (p.ProjectDescription != null &&
                         p.ProjectDescription.Contains(userDescription, StringComparison.OrdinalIgnoreCase)))
                    .ToList();
            }
        }

        // ── Get all archived projects ─────────────────────────────────────────
        public async Task<List<ArchiveCardDto>> GetArchivedProjectsAsync()
        {
            var teams = await _context.Teams
                .Include(t => t.TeamMembers)
                    .ThenInclude(tm => tm.User)
                        .ThenInclude(u => u.UserProfile)
                .Include(t => t.Supervisor)
                    .ThenInclude(s => s.UserProfile)
                .Include(t => t.Project)
                .Include(t => t.ArchivedFiles)
                .Include(t => t.Requirements)
                    .ThenInclude(r => r.CreatedBy)
                        .ThenInclude(u => u.UserProfile)
                .Where(t => t.IsArchivedV0 || t.IsArchivedV1)
                .ToListAsync();

            return teams.Select(t => BuildArchiveCard(t)).ToList();
        }

        // ── Get specific archived project ─────────────────────────────────────
        public async Task<ArchiveCardDto?> GetArchivedProjectByIdAsync(int teamId)
        {
            var team = await _context.Teams
                .Include(t => t.TeamMembers)
                    .ThenInclude(tm => tm.User)
                        .ThenInclude(u => u.UserProfile)
                .Include(t => t.Supervisor)
                    .ThenInclude(s => s.UserProfile)
                .Include(t => t.Project)
                .Include(t => t.ArchivedFiles)
                .Include(t => t.Requirements)
                    .ThenInclude(r => r.CreatedBy)
                        .ThenInclude(u => u.UserProfile)
                .FirstOrDefaultAsync(t => t.Id == teamId
                    && (t.IsArchivedV0 || t.IsArchivedV1));

            if (team == null) return null;

            return BuildArchiveCard(team);
        }

        // ── Helper ────────────────────────────────────────────────────────────
        private ArchiveCardDto BuildArchiveCard(Team t)
        {
            return new ArchiveCardDto
            {
                TeamId = t.Id,
                ProjectName = t.ProjectTitle,
                ProjectDescription = t.Project != null ? t.Project.Description : "",
                SupervisorName = t.Supervisor.UserProfile != null
                    ? t.Supervisor.UserProfile.FullName
                    : t.Supervisor.Username,
                Department = t.Supervisor.UserProfile?.Department ?? "",
                GithubRepo = t.GithubRepo,
                MemberNames = t.TeamMembers
                    .Select(tm => tm.User.UserProfile != null
                        ? tm.User.UserProfile.FullName
                        : tm.User.Username)
                    .ToList(),
                HasPhase1 = t.IsArchivedV0,
                HasPhase2 = t.IsArchivedV1,
                ArchivedAtV0 = t.ArchivedAtV0,
                ArchivedAtV1 = t.ArchivedAtV1,
                Files = t.ArchivedFiles.Select(f => new ArchivedFileDto
                {
                    Id = f.Id,
                    FileName = f.FileName,
                    FilePath = f.FilePath,
                    Description = f.Description,
                    Version = f.Version
                }).ToList(),
                Requirements = t.Requirements.Select(r => new RequirementDto
                {
                    Id = r.Id,
                    Title = r.Title,
                    Description = r.Description,
                    Priority = r.Priority,
                    Type = r.Type,
                    CreatedAt = r.CreatedAt,
                    CreatedByName = r.CreatedBy.UserProfile != null
                        ? r.CreatedBy.UserProfile.FullName
                        : r.CreatedBy.Username
                }).ToList()
            };
        }
    }
}