using OrchardCore.Modules.Manifest;

[assembly: Module(
    Name = "Media Custom API",
    Author = "Dashboard Team",
    Website = "https://orchardcore.net",
    Version = "1.0.0",
    Description = "Provides custom REST API endpoints for media management including upload, list, edit, and delete operations.",
    Category = "API",
    Dependencies = new[] { "OrchardCore.Media", "OrchardCore.OpenId" }
)]
