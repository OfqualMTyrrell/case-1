---
applyTo: '**/*.ts ,**/*.tsx,**/*.js,**/*.jsx,**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# Carbon Design System Usage

## General
- Use components, patterns and styles from `@carbon/react`.
- Reference the [Carbon Storybook](https://react.carbondesignsystem.com/) for syntax, props, and variants.
- Reference the .md files for each component in `@carbon/react` for detailed component usage.
- Use the latest version of Carbon components and icons.
- Ensure all components are responsive and follow the Carbon Design System's [responsive design guidelines](https://carbondesignsystem.com/guidelines/responsive/).
- Use the [Carbon Design System's color palette](https://carbondesignsystem.com/guidelines/color/overview/) for consistent theming.
- Use the [Carbon Design System's typography](https://carbondesignsystem.com/guidelines/typography/overview/) for consistent text styles.
- Use the [Carbon Design System's spacing](https://carbondesignsystem.com/guidelines/spacing/overview/) for consistent layout and spacing.
- Use the [Carbon Design System's icons](https://carbondesignsystem.com/guidelines/icons/overview/) for consistent iconography.
- Use the [Carbon Design System's grid](https://carbondesignsystem.com/guidelines/grid/overview/) for consistent layout structure. [REACT Grid example](https://react.carbondesignsystem.com/?path=/docs/elements-grid--default)
- Use the [Carbon Design System's theming](https://carbondesignsystem.com/guidelines/theming/overview/) for consistent theming across components.
- Use the [Carbon Design System's accessibility guidelines](https://carbondesignsystem.com/guidelines/accessibility/overview/) to ensure all components are accessible.
- Use the [Carbon Design System's motion guidelines](https://carbondesignsystem.com/guidelines/motion/overview/) for consistent animations and transitions.
- Use the [Carbon Design System's data visualization guidelines](https://carbondesignsystem.com/guidelines/data-visualization/overview/) for consistent charts and graphs.
- Use the [Carbon Design System's form guidelines](https://carbondesignsystem.com/guidelines/forms/overview/) for consistent form elements and validation.
- Use the [Carbon Design System's layout guidelines](https://carbondesignsystem.com/guidelines/layout/overview/) for consistent page structure.
- Use the [Carbon Design System's patterns](https://carbondesignsystem.com/guidelines/patterns/overview/) for consistent user interface patterns.
- Use the [Carbon Design System's resources](https://carbondesignsystem.com/resources/overview/) for additional tools and assets.
- Use the component .md files in @carbon/react to ensure you are using the correct variants, props, slots and implementation of components #githubRepo (https://github.com/carbon-design-system/carbon/tree/main/packages/react)

## Component Usage
- Use carbon components as documented in @carbon/react repository as readme .md files also available in node_modules.
- Always use styles from @carbon

## Patterns
- Follow layout and spacing guidelines from the Carbon site.
- Use `Theme` and `Layer` components for theming and layering.
- ensure all pages in this app are themed using the g100 theme applied to the whole page and viewport.

## Accessibility
- All Carbon components are accessible by default. Do not override ARIA roles unless necessary.

## Customization
- Extend components using `className` and `style` props.
- Avoid modifying internal styles directly.

## Resources
- [Carbon React GitHub](https://github.com/carbon-design-system/carbon/tree/main/packages/react)

## Customisation
Always prefer to use the Carbon Design System's components and styles. If customization is necessary, follow these guidelines:
- Use `className` and `style` props to apply custom styles.
- Use seperate files for custom styles to avoid conflicts with Carbon's styles.
- Ensure custom styles do not override Carbon's default styles unless absolutely necessary.

