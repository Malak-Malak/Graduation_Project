namespace GP_BackEnd.DTOs.Kanban
{
    public class TaskDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public string Priority { get; set; } = "Medium";
        public DateTime Deadline { get; set; }
        public string CreatedBy { get; set; }
        public List<AssignedMemberDto> AssignedMembers { get; set; }
    }
}