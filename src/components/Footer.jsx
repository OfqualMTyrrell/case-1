import React from "react";
import { Grid, Column, Link, Layer } from "@carbon/react";
import ofqualLogo from "../assets/Ofqual Logo - colour.svg"; // Adjust path if needed

function Footer() {
  return (
    <Layer as="footer" className="app-footer" style={{ padding: "2rem 0 0 0", marginTop: "auto" }}>
      {/* Divider using Carbon theme color */}
      <hr
        className="cds--hr"
        style={{
          margin: 0,
          border: 0,
          borderTop: "1px solid var(--cds-border-subtle, #393939)",
        }}
      />
      <Grid condensed style={{ alignItems: "flex-start", paddingTop: "2rem" }}>
        {/* Offset for large screens */}
        <Column sm={0} md={2} lg={3} />
        {/* Logo above links, offset to the left */}
        <Column
          sm={4}
          md={2}
          lg={2}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <img
            src={ofqualLogo}
            alt="Ofqual logo"
            className="footer-logo"
            style={{
              width: "120px",
              height: "auto",
              marginBottom: "1.5rem",
              minWidth: 80,
              maxWidth: "100%",
            }}
            id="footer-logo"
          />
        </Column>
        {/* Links and copyright */}
        <Column sm={4} md={4} lg={6}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <nav aria-label="Footer links">
              <ul
                className="footer-links-list"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  marginTop: "60px",
                }}
              >
                <li>
                  <Link href="/cookies">Cookies</Link>
                </li>
                <li>
                  <Link href="https://www.gov.uk/government/organisations/ofqual/about/personal-information-charter">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link href="https://www.gov.uk/government/publications/accessibility-statement-for-the-office-of-qualifications-and-examinations-regulation-ofqual">
                    Accessibility statement
                  </Link>
                </li>
              </ul>
            </nav>
            <div style={{ marginTop: "1.5rem", fontSize: "0.875rem" }}>
              &copy; {new Date().getFullYear()} Crown Copyright
            </div>
          </div>
        </Column>
      </Grid>
      {/* Responsive logo sizing and dynamic margin for links */}
      <style>
        {`
          .footer-logo {
            --footer-logo-height: 120px;
          }
          @media (max-width: 672px) {
            .footer-logo {
              width: 80px;
              --footer-logo-height: 80px;
            }
          }
          .footer-links-list {
            margin-top: 120;
          }
        `}
      </style>
    </Layer>
  );
}

export default Footer;