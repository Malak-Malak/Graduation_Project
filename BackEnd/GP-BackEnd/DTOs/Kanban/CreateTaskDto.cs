namespace GP_BackEnd.DTOs.Kanban
{
    public class CreateTaskDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Status { get; set; } = "To Do";
        public DateTime Deadline { get; set; }
        public List<int> AssignedUserIds { get; set; } = new();
    }
}