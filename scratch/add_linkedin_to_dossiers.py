import os

portals = ['master-portal', 'recruiter-portal', 'evaluator-portal', 'executive-portal']

for portal in portals:
    filepath = os.path.join(portal, 'src', 'components', 'CandidateProfileDossier.jsx')
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update lucide-react imports to include Linkedin
        old_import = "import { FileText, Github, ExternalLink, ArrowLeft, Sparkles } from 'lucide-react';"
        new_import = "import { FileText, Github, ExternalLink, ArrowLeft, Sparkles, Linkedin } from 'lucide-react';"
        content = content.replace(old_import, new_import)

        # Update button list to include LinkedIn right after GitHub button
        old_github_block = """                  {getBio('github_url') && (
                    <Button variant="outline" size="sm" asChild className="rounded-md">
                      <a href={formatExternalLink(getBio('github_url'))} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4 stroke-[1.5]" /> GitHub
                      </a>
                    </Button>
                  )}"""

        new_github_block = """                  {getBio('github_url') && (
                    <Button variant="outline" size="sm" asChild className="rounded-md">
                      <a href={formatExternalLink(getBio('github_url'))} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4 stroke-[1.5]" /> GitHub
                      </a>
                    </Button>
                  )}
                  {(getBio('linkedin') || getBio('linkedin_url')) && (
                    <Button variant="outline" size="sm" asChild className="rounded-md">
                      <a href={formatExternalLink(getBio('linkedin') || getBio('linkedin_url'))} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="mr-2 h-4 w-4 stroke-[1.5]" /> LinkedIn
                      </a>
                    </Button>
                  )}"""

        content = content.replace(old_github_block, new_github_block)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Added LinkedIn button to {filepath}")
