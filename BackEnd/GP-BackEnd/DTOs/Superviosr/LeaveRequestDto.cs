namespace GP_BackEnd.DTOs.Supervisor
{
    public class LeaveRequestDto
    {
        public int TeamMemberId { get; set; }
        public int TeamId { get; set; }
        public string TeamName { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public string LeaveStatus { get; set; }
    }
}