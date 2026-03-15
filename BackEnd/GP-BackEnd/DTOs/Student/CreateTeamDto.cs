namespace GP_BackEnd.DTOs.Student
{
    public class CreateTeamDto
    {
        public string ProjectTitle { get; set; }
        public int SupervisorId { get; set; }
        public List<int>? StudentIds { get; set; }
    }
}