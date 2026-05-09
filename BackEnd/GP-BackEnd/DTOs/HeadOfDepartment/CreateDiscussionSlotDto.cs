namespace GP_BackEnd.DTOs.HeadOfDepartment
{
    public class CreateDiscussionSlotDto
    {
        public DateTime DateTime { get; set; }
        public string Location { get; set; }
        public string? Notes { get; set; }
    }
}