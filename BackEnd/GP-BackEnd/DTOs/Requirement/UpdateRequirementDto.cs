namespace GP_BackEnd.DTOs.Requirement
{
    public class UpdateRequirementDto
    {
        public string Title { get; set; }
        //public string? GithubRepo { get; set; }

        public string Description { get; set; }
        public string Priority { get; set; }
        public string Type { get; set; }
    }
}