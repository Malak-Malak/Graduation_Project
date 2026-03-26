namespace GP_BackEnd.DTOs.Kanban
{
    public class KanbanBoardDto
    {
        public List<TaskDto> ToDo { get; set; }
        public List<TaskDto> InProgress { get; set; }
        public List<TaskDto> Done { get; set; }
    }
}