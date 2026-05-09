namespace GP_BackEnd.DTOs.HeadOfDepartment
{
    public class AssignedTeamDto
    {
        public int TeamId { get; set; }
        public string ProjectName { get; set; }
        public List<string> MemberNames { get; set; }
    }
}