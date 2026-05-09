namespace GP_BackEnd.DTOs.HeadOfDepartment
{
    public class DepartmentTeamDto
    {
        public int TeamId { get; set; }
        public string ProjectName { get; set; }
        public string Status { get; set; }
        public string SupervisorName { get; set; }
        public List<string> MemberNames { get; set; }
        public DiscussionSlotDto? AssignedSlot { get; set; }
    }
}