import { PRDDocument } from './types';

export function generateMarkdown(prd: PRDDocument): string {
  const sections: string[] = [];

  // Title and Summary
  sections.push(`# ${prd.title}\n`);
  sections.push(`## Summary\n\n${prd.summary}\n`);

  // Problem Statement
  sections.push(`## Problem Statement\n\n${prd.problemStatement}\n`);

  // Target Users
  sections.push(`## Target Users\n\n${prd.targetUsers}\n`);

  // Core Features
  sections.push(`## Core Features\n`);
  prd.coreFeatures.forEach((feature, index) => {
    sections.push(`### ${index + 1}. ${feature.name}\n\n${feature.description}\n`);
  });

  // Functional Requirements
  sections.push(`## Functional Requirements\n`);
  prd.functionalRequirements.forEach((req) => {
    sections.push(`- **${req.id}:** ${req.description}`);
  });
  sections.push('');

  // Non-Functional Requirements
  sections.push(`## Non-Functional Requirements\n`);
  prd.nonFunctionalRequirements.forEach((req) => {
    sections.push(`- **${req.id}:** ${req.description}`);
  });
  sections.push('');

  // User Stories
  sections.push(`## User Stories\n`);
  prd.userStories.forEach((story, index) => {
    sections.push(`### User Story ${index + 1}\n`);
    sections.push(`${story.story}\n`);
    sections.push(`**Acceptance Criteria:**`);
    story.acceptanceCriteria.forEach((criterion) => {
      sections.push(`- ${criterion}`);
    });
    sections.push('');
  });

  // Out of Scope
  sections.push(`## Out of Scope\n`);
  prd.outOfScope.forEach((item) => {
    sections.push(`- ${item}`);
  });
  sections.push('');

  // Technical Considerations
  sections.push(`## Technical Considerations\n`);
  prd.technicalConsiderations.forEach((item) => {
    sections.push(`- ${item}`);
  });
  sections.push('');

  // Implementation Roadmap
  sections.push(`## Implementation Roadmap\n`);
  prd.implementationRoadmap.forEach((phase) => {
    sections.push(`### ${phase.phase}\n`);
    phase.tasks.forEach((task) => {
      sections.push(`- ${task}`);
    });
    sections.push('');
  });

  // Assumptions (only show section if there are assumptions)
  if (prd.assumptions.length > 0) {
    sections.push(`## Assumptions\n`);
    sections.push(`> **Note:** The following assumptions were made during PRD generation. Please verify these are correct.\n`);
    prd.assumptions.forEach((assumption) => {
      sections.push(`### ${assumption.topic}\n`);
      sections.push(`- **Assumed:** ${assumption.assumed}`);
      sections.push(`- **Validate by:** ${assumption.validateBy}`);
      sections.push('');
    });
  }

  return sections.join('\n');
}
