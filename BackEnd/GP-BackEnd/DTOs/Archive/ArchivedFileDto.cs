namespace GP_BackEnd.DTOs.Archive
{
    public class ArchivedFileDto
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string? Description { get; set; }
        public int Version { get; set; } 
    }
}