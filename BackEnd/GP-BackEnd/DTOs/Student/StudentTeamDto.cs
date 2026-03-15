namespace GP_BackEnd.DTOs.Student
{
    public class StudentTeamDto
    {
        public int Id { get; set; }
        public string ProjectTitle { get; set; }
        public string Status { get; set; }
        public string SupervisorName { get; set; }
        public List<StudentMemberDto> Members { get; set; }
    }
}