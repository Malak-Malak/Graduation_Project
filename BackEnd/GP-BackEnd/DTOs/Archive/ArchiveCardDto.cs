using GP_BackEnd.DTOs.Requirement;

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
        public bool HasPhase1 { get; set; }
        public bool HasPhase2 { get; set; }
        public DateTime? ArchivedAtV0 { get; set; }
        public DateTime? ArchivedAtV1 { get; set; }
        public List<ArchivedFileDto> Files { get; set; }
        public List<RequirementDto> Requirements { get; set; }
    }
}