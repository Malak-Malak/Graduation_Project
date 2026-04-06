using GP_BackEnd.Data;
using GP_BackEnd.DTOs.Appointment;
using GP_BackEnd.Models;
using Microsoft.EntityFrameworkCore;

namespace GP_BackEnd.Services
{
    public class AppointmentService
    {
        private readonly ApplicationDbContext _context;

        public AppointmentService(ApplicationDbContext context)
        {
            _context = context;
        }

        private async Task NotifyTeamAsync(int teamId, int supervisorId, string title, string message)
        {
            var memberIds = await _context.TeamMembers
                .Where(tm => tm.TeamId == teamId)
                .Select(tm => tm.UserId)
                .ToListAsync();

            var allIds = memberIds.ToList();
            if (!allIds.Contains(supervisorId))
                allIds.Add(supervisorId);

            foreach (var uid in allIds)
            {
                _context.Notifications.Add(new Notification
                {
                    Title = title,
                    Message = message,
                    CreatedAt = DateTime.UtcNow,
                    UserId = uid
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task<bool> SetOfficeHourAsync(int supervisorId, SetOfficeHourDto dto)
        {
            var user = await _context.Users.FindAsync(supervisorId);
            if (user == null || user.Role != "Supervisor") return false;

            _context.OfficeHours.Add(new OfficeHour
            {
                SupervisorId = supervisorId,
                DayOfWeek = dto.DayOfWeek.Trim(),
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                IsOnline = dto.IsOnline
            });

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteOfficeHourAsync(int supervisorId, int officeHourId)
        {
            var oh = await _context.OfficeHours
                .FirstOrDefaultAsync(o => o.Id == officeHourId && o.SupervisorId == supervisorId);

            if (oh == null) return false;

            _context.OfficeHours.Remove(oh);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<OfficeHourDto>> GetMyOfficeHoursAsync(int supervisorId)
        {
            return await _context.OfficeHours
                .Include(o => o.Supervisor)
                    .ThenInclude(u => u.UserProfile)
                .Where(o => o.SupervisorId == supervisorId)
                .OrderBy(o => o.DayOfWeek)
                .ThenBy(o => o.StartTime)
                .Select(o => new OfficeHourDto
                {
                    Id = o.Id,
                    DayOfWeek = o.DayOfWeek,
                    StartTime = o.StartTime,
                    EndTime = o.EndTime,
                    IsOnline = o.IsOnline ?? false,
                    SupervisorName = o.Supervisor.UserProfile != null
                        ? o.Supervisor.UserProfile.FullName
                        : o.Supervisor.Username
                })
                .ToListAsync();
        }

        public async Task<List<AppointmentDto>> GetAllAppointmentsAsync(int supervisorId)
        {
            return await _context.Appointments
                .Where(a => a.SupervisorId == supervisorId)
                .Include(a => a.Team)
                .Include(a => a.Supervisor)
                    .ThenInclude(s => s.UserProfile)
                .OrderByDescending(a => a.DateTime)
                .Select(a => new AppointmentDto
                {
                    Id = a.Id,
                    DateTime = a.DateTime,
                    Status = a.Status,
                    Link = a.Link,
                    IsOnline =a.IsOnline,
                    Excuse = a.Excuse,
                    TeamId = a.TeamId,
                    ProjectName = a.Team.ProjectTitle,
                    SupervisorId = a.SupervisorId,
                    SupervisorName = a.Supervisor.UserProfile != null
                        ? a.Supervisor.UserProfile.FullName
                        : a.Supervisor.Username
                })
                .ToListAsync();
        }

        public async Task<List<AppointmentDto>> GetPendingAppointmentsAsync(int supervisorId)
        {
            return await _context.Appointments
                .Where(a => a.SupervisorId == supervisorId && a.Status == "Pending")
                .Include(a => a.Team)
                .Include(a => a.Supervisor)
                    .ThenInclude(s => s.UserProfile)
                .OrderBy(a => a.DateTime)
                .Select(a => new AppointmentDto
                {
                    Id = a.Id,
                    DateTime = a.DateTime,
                    Status = a.Status,
                    Link = a.Link,
                    IsOnline = a.IsOnline,
                    Excuse = a.Excuse,
                    TeamId = a.TeamId,
                    ProjectName = a.Team.ProjectTitle,
                    SupervisorId = a.SupervisorId,
                    SupervisorName = a.Supervisor.UserProfile != null
                        ? a.Supervisor.UserProfile.FullName
                        : a.Supervisor.Username
                })
                .ToListAsync();
        }

        public async Task<bool> RespondToAppointmentAsync(int supervisorId, RespondToAppointmentDto dto)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Team)
                .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId
                                       && a.SupervisorId == supervisorId
                                       && a.Status == "Pending");

            if (appointment == null) return false;

            appointment.Status = dto.IsApproved ? "Approved" : "Rejected";

            if (dto.IsApproved && !string.IsNullOrEmpty(dto.Link))
                appointment.Link = dto.Link;

            await _context.SaveChangesAsync();

            var supervisorName = await _context.UserProfiles
                .Where(p => p.UserId == supervisorId)
                .Select(p => p.FullName)
                .FirstOrDefaultAsync() ?? "Your supervisor";

            var msg = dto.IsApproved
                ? $"{supervisorName} approved your appointment request."
                : $"{supervisorName} rejected your appointment request.";

            await NotifyTeamAsync(appointment.TeamId, supervisorId, "Appointment Update", msg);
            return true;
        }

        public async Task<List<OfficeHourDto>> GetSupervisorOfficeHoursAsync(int studentId)
        {
            var teamMember = await _context.TeamMembers
                .Include(tm => tm.Team)
                .FirstOrDefaultAsync(tm => tm.UserId == studentId && tm.Team.Status == "Active");

            if (teamMember == null) return new List<OfficeHourDto>();

            int supervisorId = teamMember.Team.SupervisorId;

            return await _context.OfficeHours
                .Include(o => o.Supervisor)
                    .ThenInclude(u => u.UserProfile)
                .Where(o => o.SupervisorId == supervisorId)
                .OrderBy(o => o.DayOfWeek)
                .ThenBy(o => o.StartTime)
                .Select(o => new OfficeHourDto
                {
                    Id = o.Id,
                    DayOfWeek = o.DayOfWeek,
                    StartTime = o.StartTime,
                    EndTime = o.EndTime,
                    IsOnline = o.IsOnline ?? false,
                    SupervisorName = o.Supervisor.UserProfile != null
                        ? o.Supervisor.UserProfile.FullName
                        : o.Supervisor.Username
                })
                .ToListAsync();
        }

        public async Task<bool> RequestAppointmentAsync(int studentId, RequestAppointmentDto dto)
        {
            var teamMember = await _context.TeamMembers
                .Include(tm => tm.Team)
                .FirstOrDefaultAsync(tm => tm.UserId == studentId && tm.Team.Status == "Active");

            if (teamMember == null) return false;

            var existingPending = await _context.Appointments
                .AnyAsync(a => a.TeamId == teamMember.Team.Id && a.Status == "Pending");

            if (existingPending) return false;

            var officeHour = await _context.OfficeHours
                .FirstOrDefaultAsync(o => o.Id == dto.OfficeHourId
                                       && o.SupervisorId == teamMember.Team.SupervisorId);

            if (officeHour == null) return false;

            var appointmentDateTime = GetNextOccurrence(officeHour.DayOfWeek, officeHour.StartTime);

            var appointment = new Appointment
            {
                DateTime = appointmentDateTime,
                Status = "Pending",
                IsOnline = officeHour.IsOnline ?? false,
                Link = string.Empty,
                Excuse = null,
                TeamId = teamMember.Team.Id,
                SupervisorId = teamMember.Team.SupervisorId
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            var studentName = await _context.UserProfiles
                .Where(p => p.UserId == studentId)
                .Select(p => p.FullName)
                .FirstOrDefaultAsync() ?? "A student";

            await NotifyTeamAsync(
                teamMember.Team.Id,
                teamMember.Team.SupervisorId,
                "New Appointment Request",
                $"{studentName} requested a {(officeHour.IsOnline == true ? "online" : "in-person")} appointment on {appointmentDateTime:ddd dd MMM} at {officeHour.StartTime:hh\\:mm}."
            );

            return true;
        }

        public async Task<List<AppointmentDto>> GetMyAppointmentsAsync(int studentId)
        {
            var teamMember = await _context.TeamMembers
                .Include(tm => tm.Team)
                .FirstOrDefaultAsync(tm => tm.UserId == studentId && tm.Team.Status == "Active");

            if (teamMember == null) return new List<AppointmentDto>();

            return await _context.Appointments
                .Where(a => a.TeamId == teamMember.Team.Id)
                .Include(a => a.Team)
                .Include(a => a.Supervisor)
                    .ThenInclude(s => s.UserProfile)
                .OrderByDescending(a => a.DateTime)
                .Select(a => new AppointmentDto
                {
                    Id = a.Id,
                    DateTime = a.DateTime,
                    Status = a.Status,
                    Link = a.Link,
                    IsOnline = a.IsOnline,
                    Excuse = a.Excuse,
                    TeamId = a.TeamId,
                    ProjectName = a.Team.ProjectTitle,
                    SupervisorId = a.SupervisorId,
                    SupervisorName = a.Supervisor.UserProfile != null
                        ? a.Supervisor.UserProfile.FullName
                        : a.Supervisor.Username
                })
                .ToListAsync();
        }

        public async Task<bool> UpdateAppointmentAsync(int studentId, UpdateAppointmentDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Excuse))
                return false;

            var appointment = await _context.Appointments
                .Include(a => a.Team)
                    .ThenInclude(t => t.TeamMembers)
                .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId);

            if (appointment == null) return false;

            var isMember = appointment.Team.TeamMembers.Any(tm => tm.UserId == studentId);
            if (!isMember) return false;

            if (appointment.Status == "Rejected") return false;

            var officeHour = await _context.OfficeHours
                .FirstOrDefaultAsync(o => o.Id == dto.OfficeHourId
                                       && o.SupervisorId == appointment.SupervisorId);

            if (officeHour == null) return false;

            var newDateTime = GetNextOccurrence(officeHour.DayOfWeek, officeHour.StartTime);

            appointment.DateTime = newDateTime;
            appointment.IsOnline = officeHour.IsOnline ?? false;
            appointment.Excuse = dto.Excuse;
            appointment.Status = "Pending";

            await _context.SaveChangesAsync();

            var studentName = await _context.UserProfiles
                .Where(p => p.UserId == studentId)
                .Select(p => p.FullName)
                .FirstOrDefaultAsync() ?? "A student";

            await NotifyTeamAsync(
                appointment.TeamId,
                appointment.SupervisorId,
                "Appointment Rescheduled",
                $"{studentName} rescheduled the appointment to {newDateTime:ddd dd MMM} at {officeHour.StartTime:hh\\:mm}. Excuse: {dto.Excuse}"
            );

            return true;
        }

        private static DateTime GetNextOccurrence(string dayName, TimeSpan time)
        {
            if (!Enum.TryParse<DayOfWeek>(dayName, true, out var targetDay))
                targetDay = DayOfWeek.Sunday;

            var today = DateTime.UtcNow.Date;
            int daysUntil = ((int)targetDay - (int)today.DayOfWeek + 7) % 7;
            if (daysUntil == 0) daysUntil = 7;
            return DateTime.SpecifyKind(today.AddDays(daysUntil) + time, DateTimeKind.Utc);
        }
    }
}