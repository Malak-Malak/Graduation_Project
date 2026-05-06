namespace GP_BackEnd.DTOs.Archive
{
    public class ArchiveCardDto
    {
        public int TeamId { get; set; }
        public string ProjectName { get; set; }
        public string ProjectDescription { get; set; }
        public string SupervisorName { get; set; }
        public string Department { get; set; }
        public string? GithubRepo { get; set; }
        public List<string> MemberNames { get; set; }
        public DateTime ArchivedAt { get; set; }
        public int Version { get; set; }
    }
}