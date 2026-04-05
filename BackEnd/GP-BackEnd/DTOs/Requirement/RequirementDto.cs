namespace GP_BackEnd.DTOs.Requirement
{
    public class RequirementDto
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedByName { get; set; }
    }
}