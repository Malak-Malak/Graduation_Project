namespace GP_BackEnd.DTOs.Kanban
{
    public class UpdateTaskDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime Deadline { get; set; }
        public string Priority { get; set; } = "Medium";
        public List<int> AssignedUserIds { get; set; } = new();
    }
}