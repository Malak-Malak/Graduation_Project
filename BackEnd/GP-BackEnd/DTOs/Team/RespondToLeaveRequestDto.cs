namespace GP_BackEnd.DTOs.Team
{
    public class RespondToLeaveRequestDto
    {
        public int TeamMemberId { get; set; }
        public bool IsApproved { get; set; }
    }
}