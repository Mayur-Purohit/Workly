from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = "Execute all seed commands sequentially to fully populate the database."

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting full database seeding process..."))

        commands = [
            "seed_config_data",
            "seed_skills",
            "seed_coding_problems",
            "seed_mcq_questions",
            "seed_reviews",
            "seed_imported_data",
        ]

        for cmd in commands:
            self.stdout.write(self.style.WARNING(f"\n---> Executing management command: {cmd}"))
            try:
                call_command(cmd)
                self.stdout.write(self.style.SUCCESS(f"Successfully finished: {cmd}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error running {cmd}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS("\n[SUCCESS] All database seed commands completed successfully!"))
