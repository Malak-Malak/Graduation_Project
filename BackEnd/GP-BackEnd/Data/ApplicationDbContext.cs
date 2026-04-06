using Microsoft.EntityFrameworkCore;
using GP_BackEnd.Models;

namespace GP_BackEnd.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
           : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<TeamMember> TeamMembers { get; set; }
        public DbSet<TaskItem> TaskItems { get; set; }
        public DbSet<ProjectFile> ProjectFiles { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<TeamProgressReport> TeamProgressReports { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<RegistrationRequest> RegistrationRequests { get; set; }
        public DbSet<UniversityRecord> UniversityRecords { get; set; }
        public DbSet<TeamJoinRequest> TeamJoinRequests { get; set; }
        public DbSet<TaskAssignment> TaskAssignments { get; set; }
        public DbSet<Requirement> Requirements { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Project -> Supervisor (User)
            modelBuilder.Entity<Project>()
                .HasOne(p => p.Supervisor)
                .WithMany()
                .HasForeignKey(p => p.SupervisorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Team -> Supervisor (User)
            modelBuilder.Entity<Team>()
                .HasOne(t => t.Supervisor)
                .WithMany(u => u.SupervisedTeams)
                .HasForeignKey(t => t.SupervisorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Team -> CreatedBy (User)
            modelBuilder.Entity<Team>()
                .HasOne(t => t.CreatedBy)
                .WithMany()
                .HasForeignKey(t => t.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // TeamMember -> Team
            modelBuilder.Entity<TeamMember>()
                .HasOne(tm => tm.Team)
                .WithMany(t => t.TeamMembers)
                .HasForeignKey(tm => tm.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            // TeamMember -> User
            modelBuilder.Entity<TeamMember>()
                .HasOne(tm => tm.User)
                .WithMany(u => u.TeamMembers)
                .HasForeignKey(tm => tm.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // TaskItem -> Team
            modelBuilder.Entity<TaskItem>()
                .HasOne(ti => ti.Team)
                .WithMany(t => t.Tasks)
                .HasForeignKey(ti => ti.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            // TaskItem -> Project
            modelBuilder.Entity<TaskItem>()
                .HasOne(ti => ti.Project)
                .WithMany(p => p.Tasks)
                .HasForeignKey(ti => ti.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            // TaskAttachment -> Team
            modelBuilder.Entity<ProjectFile>()
                .HasOne(ta => ta.Team)
                .WithMany(t => t.Attachments)
                .HasForeignKey(ta => ta.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            // TaskAttachment -> User
            modelBuilder.Entity<ProjectFile>()
                .HasOne(ta => ta.User)
                .WithMany(u => u.ProjectFiles)
                .HasForeignKey(ta => ta.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // TeamProgressReport -> Team
            modelBuilder.Entity<TeamProgressReport>()
                .HasOne(r => r.Team)
                .WithMany(t => t.ProgressReports)
                .HasForeignKey(r => r.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            // TeamProgressReport -> Project
            modelBuilder.Entity<TeamProgressReport>()
                .HasOne(r => r.Project)
                .WithMany(p => p.ProgressReports)
                .HasForeignKey(r => r.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            // Appointment -> Team
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Team)
                .WithMany(t => t.Appointments)
                .HasForeignKey(a => a.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            // Appointment -> Supervisor (User)
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Supervisor)
                .WithMany()
                .HasForeignKey(a => a.SupervisorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Notification -> User
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // UserProfile -> User (one-to-one)
            modelBuilder.Entity<UserProfile>()
                .HasOne(sp => sp.User)
                .WithOne(u => u.UserProfile)
                .HasForeignKey<UserProfile>(sp => sp.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Feedback -> Sender (User)
            modelBuilder.Entity<Feedback>()
                .HasOne(f => f.Sender)
                .WithMany(u => u.Feedbacks)
                .HasForeignKey(f => f.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            // Feedback -> Team
            modelBuilder.Entity<Feedback>()
                .HasOne(f => f.Team)
                .WithMany(t => t.Feedbacks)
                .HasForeignKey(f => f.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            // Feedback -> TaskItem (optional)
            modelBuilder.Entity<Feedback>()
                .HasOne(f => f.TaskItem)
                .WithMany(ti => ti.Feedbacks)
                .HasForeignKey(f => f.TaskItemId)
                .OnDelete(DeleteBehavior.Restrict);

            // Feedback self-reference (replies)
            modelBuilder.Entity<Feedback>()
                .HasOne(f => f.ParentFeedback)
                .WithMany(f => f.Replies)
                .HasForeignKey(f => f.ParentFeedbackId)
                .OnDelete(DeleteBehavior.Restrict);

            // TeamJoinRequest -> Team
            modelBuilder.Entity<TeamJoinRequest>()
                .HasOne(jr => jr.Team)
                .WithMany()
                .HasForeignKey(jr => jr.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            // TeamJoinRequest -> Student (User)
            modelBuilder.Entity<TeamJoinRequest>()
                .HasOne(jr => jr.Student)
                .WithMany()
                .HasForeignKey(jr => jr.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
            // TaskAssignment -> TaskItem
            modelBuilder.Entity<TaskAssignment>()
                .HasOne(ta => ta.TaskItem)
                .WithMany(t => t.Assignments)
                .HasForeignKey(ta => ta.TaskItemId)
                .OnDelete(DeleteBehavior.Cascade);

            // TaskAssignment -> User
            modelBuilder.Entity<TaskAssignment>()
                .HasOne(ta => ta.User)
                .WithMany(u => u.TaskAssignments)
                .HasForeignKey(ta => ta.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // TaskItem -> CreatedBy (User)
            modelBuilder.Entity<TaskItem>()
                .HasOne(ti => ti.CreatedBy)
                .WithMany()
                .HasForeignKey(ti => ti.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Team -> Project (one-to-one)
            modelBuilder.Entity<Team>()
                .HasOne(t => t.Project)
                .WithOne(p => p.Team)
                .HasForeignKey<Team>(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);
            // Requirement -> Team  
            modelBuilder.Entity<Requirement>()
                .HasOne(r => r.Team)
                .WithMany(t => t.Requirements)
                .HasForeignKey(r => r.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            // Requirement -> CreatedBy (User)
            modelBuilder.Entity<Requirement>()
                .HasOne(r => r.CreatedBy)
                .WithMany()
                .HasForeignKey(r => r.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

   

            // Username must be unique
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();
        }


    }
}
