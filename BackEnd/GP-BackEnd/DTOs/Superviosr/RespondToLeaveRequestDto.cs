namespace GP_BackEnd.DTOs.Supervisor
{
    public class RespondToLeaveRequestDto
    {
        public int TeamMemberId { get; set; }
        public bool IsApproved { get; set; }
    }
}