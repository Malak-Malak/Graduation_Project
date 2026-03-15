namespace GP_BackEnd.DTOs.Supervisor
{
    public class PendingTeamDto
    {
        public int Id { get; set; }
        public string ProjectTitle { get; set; }
        public string CreatedByUsername { get; set; }
        public DateTime CreatedAt { get; set; }
        public int MembersCount { get; set; }
    }
}