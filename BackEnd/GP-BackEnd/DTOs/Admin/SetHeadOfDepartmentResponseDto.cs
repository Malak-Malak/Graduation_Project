namespace GP_BackEnd.DTOs.Admin
{
    public class SetHeadOfDepartmentResponseDto
    {
        public bool HasConflict { get; set; }
        public string? ExistingHodName { get; set; }
        public string? Message { get; set; }
    }
}