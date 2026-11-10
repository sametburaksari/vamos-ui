import { Card, CardBody, Prose, ProseTable } from "@vamos-cms/ui";

export default function TypographyProse() {
  return (
    <Card className="w-full max-w-3xl">
      <CardBody className="py-8 sm:px-10">
        <Prose lang="en">
          <h1>
            A slower kind of <em>service</em>
          </h1>
          <p>
            When we opened in Moda in 2019, we had eleven tables and one rule: nobody is rushed. Five years later we have one long table, a set menu that
            changes every week, and the same rule. This is how a dinner at <a href="#reserve">Sofra</a> works.
          </p>
          <h2>The evening</h2>
          <p>
            Doors open at <strong>19:00</strong>. Dinner starts at 19:30 whether everyone is seated or not — the first course is always something to share,
            so late guests catch up easily.
          </p>
          <ul>
            <li>Six courses, served family-style.</li>
            <li>A natural-wine pairing, or a non-alcoholic one made in house.</li>
            <li>
              Allergies? Tell us when you book — we cook for <mark>gluten-free</mark>, vegetarian and nut-free guests every night.
            </li>
          </ul>
          <blockquote>
            <p>
              The best restaurant meal I&apos;ve had in Istanbul, and I&apos;m <em>from</em> here.
            </p>
            <cite>— Ayşe Demir, Istanbul Eats</cite>
          </blockquote>
          <h3>Prices</h3>
          <ProseTable label="Prices per person">
            <table>
              <thead>
                <tr>
                  <th>Option</th>
                  <th>Weeknights</th>
                  <th>Fri – Sat</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Set menu</td>
                  <td>$68</td>
                  <td>$78</td>
                </tr>
                <tr>
                  <td>Wine pairing</td>
                  <td>$42</td>
                  <td>$42</td>
                </tr>
                <tr>
                  <td>House pairing (0%)</td>
                  <td>$24</td>
                  <td>$24</td>
                </tr>
              </tbody>
            </table>
          </ProseTable>
          <p>
            Cancel up to 24 hours before for a full refund. Use code <code>SPRING24</code> at checkout for a glass of pét-nat on arrival.
          </p>
        </Prose>
      </CardBody>
    </Card>
  );
}
