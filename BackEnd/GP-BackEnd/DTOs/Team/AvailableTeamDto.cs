namespace GP_BackEnd.DTOs.Team
{
    public class AvailableTeamDto
    {
        public int Id { get; set; }
        public string ProjectTitle { get; set; }
        public string SupervisorName { get; set; }
        public int MembersCount { get; set; }
        public int RemainingSlots { get; set; }
    }
}