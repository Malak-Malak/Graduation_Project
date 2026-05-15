namespace GP_BackEnd.DTOs.Auth
{
    public class LoginResponseDto
    {
        public string Token { get; set; }
        public string Username { get; set; }
        public string Role { get; set; }
        public int UserId { get; set; }
        public bool IsHeadOfDepartment { get; set; }
    }
}