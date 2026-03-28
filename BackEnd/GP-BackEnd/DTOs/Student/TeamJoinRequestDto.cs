namespace GP_BackEnd.DTOs.Student
{
    public class TeamJoinRequestDto
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public DateTime SentAt { get; set; }
    }
}