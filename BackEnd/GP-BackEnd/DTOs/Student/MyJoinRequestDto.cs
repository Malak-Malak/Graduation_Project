namespace GP_BackEnd.DTOs.Student
{
    public class MyJoinRequestDto
    {
        public int Id { get; set; }
        public int TeamId { get; set; }
        public string TeamName { get; set; }
        public string Status { get; set; }
        public DateTime SentAt { get; set; }
    }
}