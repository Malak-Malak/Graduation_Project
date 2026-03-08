namespace GP_BackEnd.DTOs.Admin
{
    public class UniversityRecordDto
    {
        public int Id { get; set; }
        public string UniversityEmail { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public string Role { get; set; }
        public string Department { get; set; }
        public bool IsGraduate { get; set; }
    }
}
