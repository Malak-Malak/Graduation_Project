namespace GP_BackEnd.DTOs
{
    public class UserProfileDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string PhoneNumber { get; set; }
        public string FullName { get; set; }
        public string Department { get; set; }
        public string? Field { get; set; }
        public string? GitHubLink { get; set; }
        public string? LinkedinLink { get; set; }
        public string PersonalEmail { get; set; }
        public bool IsGraduate { get; set; }
        public int TotalNumOfCreditCards { get; set; }
    }
}