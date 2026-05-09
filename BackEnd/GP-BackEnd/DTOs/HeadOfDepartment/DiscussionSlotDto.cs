namespace GP_BackEnd.DTOs.HeadOfDepartment
{
    public class DiscussionSlotDto
    {
        public int Id { get; set; }
        public DateTime DateTime { get; set; }
        public string Location { get; set; }
        public string? Notes { get; set; }
        public string Department { get; set; }
        public List<AssignedTeamDto> AssignedTeams { get; set; } = new();
    }
}