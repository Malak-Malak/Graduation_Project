namespace GP_BackEnd.DTOs.Supervisor
{
    public class SupervisedTeamDto
    {
        public int Id { get; set; }
        public string ProjectTitle { get; set; }
        public string ProjectDescription { get; set; }
        public string Status { get; set; }
        public List<SupervisedTeamMemberDto> Members { get; set; }
    }
}