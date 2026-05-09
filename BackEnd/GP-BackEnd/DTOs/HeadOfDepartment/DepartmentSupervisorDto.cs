namespace GP_BackEnd.DTOs.HeadOfDepartment
{
    public class DepartmentSupervisorDto
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public List<DepartmentTeamDto> Teams { get; set; } = new();
    }
}