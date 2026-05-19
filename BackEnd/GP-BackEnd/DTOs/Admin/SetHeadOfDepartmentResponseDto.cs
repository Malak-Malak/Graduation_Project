namespace GP_BackEnd.DTOs.Admin
{
    public class SetHeadOfDepartmentResponseDto
    {
        public bool Success { get; set; }
        public bool HasConflict { get; set; }
        public string? ExistingHodName { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}