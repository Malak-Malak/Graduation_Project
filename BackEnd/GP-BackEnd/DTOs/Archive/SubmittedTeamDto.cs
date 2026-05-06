namespace GP_BackEnd.DTOs.Archive
{
    public class SubmittedTeamDto
    {
        public int TeamId { get; set; }
        public string ProjectName { get; set; }
        public string ProjectDescription { get; set; }
        public string? GithubRepo { get; set; }
        public List<string> MemberNames { get; set; }
        public int Version { get; set; }
    }
}