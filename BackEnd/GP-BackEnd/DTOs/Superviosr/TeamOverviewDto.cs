using GP_BackEnd.DTOs.FileSystem;
using GP_BackEnd.DTOs.Kanban;

namespace GP_BackEnd.DTOs.Supervisor
{
    public class TeamOverviewDto
    {
        public int TeamId { get; set; }
        public string TeamName { get; set; }
        public string Status { get; set; }
        public List<TaskDto> TasksPhase1 { get; set; } = new();
        public List<TaskDto> TasksPhase2 { get; set; } = new();
        public List<AttachmentDto> SupervisorFiles { get; set; } = new();
        public List<AttachmentDto> StudentFiles { get; set; } = new();
    }
}