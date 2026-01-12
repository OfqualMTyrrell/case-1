import React from "react";
import { Grid, Column, Link, Layer, Stack } from "@carbon/react";
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
      <Grid condensed style={{ alignItems: "flex-start" }}>
        {/* Full width - sm: 4/4 md: 8/8 lg: 16/16 */}
        <Column
          sm={4} 
          md={8} 
          lg={16} 
        >
          <Stack as="div" gap={6} orientation="vertical">
           <div>
              <Link href="https://gov.uk/ofqual">
                <img
                  src={ofqualLogo}
                  alt="Ofqual logo"
                  className="footer-logo"
                  style={{
                    width: "120px",
                    height: "auto",
                    marginTop: "1.5rem",
                    minWidth: 80,
                    maxWidth: "100%",
                  }}
                  id="footer-logo"
                />
              </Link>  
            </div>

            <nav aria-label="Footer links">
              <Stack as="ul" gap={6} orientation="horizontal">
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
              </Stack>
            </nav>
              
            <div>
              For technical support with this system please contact <Link href="mailto:">PortalSupport@ofqual.gov.uk</Link>
            </div>

            <div>
              &copy; Crown Copyright {new Date().getFullYear()}
          </div>
          </Stack>
        </Column>
      </Grid>
    </Layer>
  );
}

export default Footer;