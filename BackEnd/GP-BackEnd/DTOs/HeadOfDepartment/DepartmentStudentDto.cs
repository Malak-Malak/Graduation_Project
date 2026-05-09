namespace GP_BackEnd.DTOs.HeadOfDepartment
{
    public class DepartmentStudentDto
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public bool IsInTeam { get; set; }
        public string? TeamName { get; set; }
    }
}