namespace GP_BackEnd.DTOs.Student
{
   
    public class AvailableStudentDto
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public string? Field { get; set; }  
    }
}