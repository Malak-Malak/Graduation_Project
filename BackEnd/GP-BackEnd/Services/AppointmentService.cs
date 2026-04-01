using GP_BackEnd.Data;
using GP_BackEnd.DTOs.Appointment;
using GP_BackEnd.DTOs.Student;
using GP_BackEnd.DTOs.Supervisor;
using GP_BackEnd.Models;
using Microsoft.EntityFrameworkCore;

namespace GP_BackEnd.Services
{
    public class AppointmentService
    {
        private readonly ApplicationDbContext _context;

        public AppointmentService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Student: request a new appointment
        public async Task<bool> RequestAppointmentAsync(int studentId, RequestAppointmentDto dto)
        {
            // Get the student's active team
            var teamMember = await _context.TeamMembers
                .Include(tm => tm.Team)
                .FirstOrDefaultAsync(tm => tm.UserId == studentId && tm.Team.Status == "Active");

            if (teamMember == null)
                return false;

            // Block if there is already a pending appointment for this team
            var existingPending = await _context.Appointments
                .AnyAsync(a => a.TeamId == teamMember.Team.Id && a.Status == "Pending");

            if (existingPending)
                return false;

            var appointment = new Appointment
            {
                DateTime = DateTime.SpecifyKind(dto.DateTime, DateTimeKind.Utc),
                Status = "Pending",
                Link = string.Empty,
                TeamId = teamMember.Team.Id,
                SupervisorId = teamMember.Team.SupervisorId
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();
            return true;
        }

        // Student: get all appointments for their team
        public async Task<List<AppointmentDto>> GetMyAppointmentsAsync(int studentId)
        {
            var teamMember = await _context.TeamMembers
                .Include(tm => tm.Team)
                .FirstOrDefaultAsync(tm => tm.UserId == studentId && tm.Team.Status == "Active");

            if (teamMember == null)
                return new List<AppointmentDto>();

            return await _context.Appointments
                .Where(a => a.TeamId == teamMember.Team.Id)
                .Include(a => a.Team)
                .Include(a => a.Supervisor)
                    .ThenInclude(s => s.UserProfile)
                .Select(a => new AppointmentDto
                {
                    Id = a.Id,
                    DateTime = a.DateTime,
                    Status = a.Status,
                    Link = a.Link,
                    TeamId = a.TeamId,
                    ProjectName = a.Team.ProjectTitle,
                    SupervisorName = a.Supervisor.UserProfile.FullName
                })
                .ToListAsync();
        }

        // Supervisor: get all pending appointments
        public async Task<List<AppointmentDto>> GetPendingAppointmentsAsync(int supervisorId)
        {
            return await _context.Appointments
                .Where(a => a.SupervisorId == supervisorId && a.Status == "Pending")
                .Include(a => a.Team)
                .Include(a => a.Supervisor)
                    .ThenInclude(s => s.UserProfile)
                .Select(a => new AppointmentDto
                {
                    Id = a.Id,
                    DateTime = a.DateTime,
                    Status = a.Status,
                    Link = a.Link,
                    TeamId = a.TeamId,
                    ProjectName = a.Team.ProjectTitle,
                    SupervisorName = a.Supervisor.UserProfile.FullName
                })
                .ToListAsync();
        }

        // Supervisor: approve or reject an appointment
        public async Task<bool> RespondToAppointmentAsync(int supervisorId, RespondToAppointmentDto dto)
        {
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId
                                       && a.SupervisorId == supervisorId
                                       && a.Status == "Pending");

            if (appointment == null)
                return false;

            appointment.Status = dto.IsApproved ? "Approved" : "Rejected";

            // Add meeting link only if approved
            if (dto.IsApproved && !string.IsNullOrEmpty(dto.Link))
                appointment.Link = dto.Link;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}