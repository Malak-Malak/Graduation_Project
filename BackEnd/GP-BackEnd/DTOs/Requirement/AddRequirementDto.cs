namespace GP_BackEnd.DTOs.Requirement
{
    public class AddRequirementDto
    {
        public string Title { get; set; }
        public string? GithubRepo { get; set; }

        public string Description { get; set; }
        public string Priority { get; set; } = "Medium";
        public string Type { get; set; } = "Functional";
    }
}