namespace GP_BackEnd.DTOs.Team
{
    public class TeamDto
    {
        public int Id { get; set; }
        public string ProjectTitle { get; set; }
        public string Status { get; set; }
        public string SupervisorName { get; set; }
        public List<TeamMemberDto> Members { get; set; }
    }
}
