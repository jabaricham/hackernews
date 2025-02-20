using Flurl.Http.Configuration;
using HackerRankFeedApi.Infrastructure;
using HackerRankFeedApi.Repositories;
using HackerRankFeedApi.Services;
using Microsoft.EntityFrameworkCore;

namespace HackerRankFeedApi;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services
            .AddDbContext<HnDbContext>(options => options.UseSqlite($"Data Source=hnNews.db"));
        // Add CORS configuration
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowLocalhost4200", policy =>
            {
                policy.WithOrigins("http://localhost:4200")
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });
        
        // Add services to the container.
        builder.Services.AddControllers();
        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        builder.Services.AddOpenApi();
        builder.Services.AddScoped<IHnNewsService, HnNewsService>();
        builder.Services.AddScoped<IHnNewsRepository, HnNewsRepository>();
        // Add FlurlClientCache to the DI container
        var hnApiBaseUrl = builder.Configuration.GetValue<string>("HnApiBaseUrl");
        builder.Services.AddSingleton<IFlurlClientCache>(sp => new FlurlClientCache()
            .Add("HnApi", hnApiBaseUrl));
        
        var app = builder.Build();

        {
            using var scope = app.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<HnDbContext>();
            await dbContext.Database.EnsureCreatedAsync();
        }
        
        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }
        
        // Use CORS middleware
        app.UseCors("AllowLocalhost4200");

        app.UseHttpsRedirection();

        app.UseAuthorization();


        app.MapControllers();

        app.Run();
    }
}