namespace GP_BackEnd.DTOs.HeadOfDepartment
{
    public class MyDiscussionSlotDto
    {
        public int SlotId { get; set; }
        public DateTime DateTime { get; set; }
        public string Location { get; set; }
        public string? Notes { get; set; }
        public string TeamName { get; set; }
    }
}