namespace GP_BackEnd.DTOs.Kanban
{
    public class UpdateTaskStatusDto
    {
        public int TaskId { get; set; }
        public string Status { get; set; }
    }
}