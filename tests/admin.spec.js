import { test, expect } from "@playwright/test";
import { MongoClient } from "mongodb";
import fs from "node:fs";
const origin = "http://localhost:5175";
const credentials = {
  email: "e2e@mohor.local",
  password: "Mohor-E2E-only-7284!",
};
let client, db;
test.beforeAll(async () => {
  if (!process.env.MOHOR_TEST_DB?.startsWith("mohor_e2e_"))
    throw Error("Test database required");
  client = await new MongoClient("mongodb://127.0.0.1:27020").connect();
  db = client.db(process.env.MOHOR_TEST_DB);
});
test.beforeEach(async () => {
  await db.dropDatabase();
});
test.afterAll(async () => {
  await db?.dropDatabase();
  await client?.close();
});
async function login(page) {
  await page.goto("/admin");
  await page.getByLabel("Email", { exact: true }).fill(credentials.email);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Featured work", exact: true }),
  ).toBeVisible();
}
async function section(page, name) {
  await page
    .getByRole("navigation", { name: "Admin sections" })
    .getByRole("button", { name })
    .click();
}
async function add(page, type, title, description = "") {
  await page
    .getByRole("button", { name: `Add ${type}`, exact: true })
    .first()
    .click();
  await page
    .getByLabel(
      type === "work"
        ? "Project title"
        : type === "story"
          ? "Client name"
          : "Brand name",
      { exact: true },
    )
    .fill(title);
  if (description)
    await page
      .getByLabel(
        type === "story" ? "Client quote" : "Description (optional)",
        { exact: true },
      )
      .fill(description);
}
async function review(page) {
  await page.getByRole("button", { name: "3 Review" }).click();
}
async function publish(page) {
  await review(page);
  await page
    .getByRole("button", { name: "Publish to website", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "published on the website",
  );
}
async function publicPage(context) {
  const p = await context.newPage();
  await p.goto("/");
  await p
    .locator(".mm-intro")
    .waitFor({ state: "hidden", timeout: 20000 })
    .catch(() => {});
  return p;
}
const item = (title, overrides = {}) => ({
  id: crypto.randomUUID(),
  title,
  subtitle: "",
  description: "A client story",
  category: "Other",
  result: "",
  kind: "text",
  mediaUrl: "",
  posterUrl: "",
  alt: "",
  link: "",
  status: "published",
  ...overrides,
});

test("login, protected routes, bad credentials and logout revocation", async ({
  page,
  request,
}) => {
  expect((await request.get("/api/admin/content")).status()).toBe(401);
  expect(
    (
      await request.post("/api/admin/login", {
        headers: { Origin: origin },
        data: { ...credentials, password: "incorrect" },
      })
    ).status(),
  ).toBe(401);
  await login(page);
  const cookie = (await page.context().cookies()).find(
    (c) => c.name === "mohor_admin",
  );
  expect(cookie.httpOnly).toBe(true);
  expect(cookie.sameSite).toBe("Strict");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Featured work", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
  expect(
    (
      await request.get("/api/admin/content", {
        headers: { Cookie: `mohor_admin=${cookie.value}` },
      })
    ).status(),
  ).toBe(401);
});

test("work draft → published → edited → unpublished → deleted, staying in work", async ({
  page,
  context,
}) => {
  await login(page);
  await add(
    page,
    "work",
    "Summer campaign",
    "A fresh campaign for a local studio.",
  );
  await page
    .getByLabel("Service", { exact: true })
    .selectOption("Social Media");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("saved as a draft");
  let web = await publicPage(context);
  await expect(
    web.getByRole("heading", { name: "Summer campaign", exact: true }),
  ).toHaveCount(0);
  await web.close();
  await page
    .getByRole("button", { name: "Edit Summer campaign", exact: true })
    .click();
  await publish(page);
  await expect(
    page.getByRole("heading", { name: "Featured work", exact: true }),
  ).toBeVisible();
  web = await publicPage(context);
  await expect(
    web.getByRole("heading", { name: "Summer campaign", exact: true }),
  ).toBeVisible();
  await expect(web.locator("#mm-work")).toContainText("A fresh campaign");
  await page
    .getByRole("button", { name: "Edit Summer campaign", exact: true })
    .click();
  await page
    .getByLabel("Project title", { exact: true })
    .fill("Summer campaign updated");
  await review(page);
  await page
    .getByRole("button", { name: "Publish changes", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("published");
  await web.reload();
  await expect(
    web.getByRole("heading", { name: "Summer campaign updated", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit Summer campaign updated", exact: true })
    .click();
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Unpublish & save draft", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("saved as a draft");
  await web.reload();
  await expect(web.locator("#mm-work")).toHaveCount(0);
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", {
      name: "Delete Summer campaign updated",
      exact: true,
    })
    .click();
  await expect(page.getByRole("status")).toContainText("deleted");
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Edit Summer campaign updated",
      exact: true,
    }),
  ).toHaveCount(0);
});

test("image upload publishes real image and alt text; validation and large upload errors", async ({
  page,
  context,
}) => {
  await login(page);
  await add(page, "work", "Arka campaign");
  await page.getByRole("button", { name: "2 Media" }).click();
  await page.getByRole("radio", { name: /Image/ }).check();
  await page
    .getByLabel("Upload image", { exact: true })
    .setInputFiles("public/clients/arka.png");
  await expect(page.getByLabel("Image URL", { exact: true })).toHaveValue(
    /\/api\/media/,
  );
  await review(page);
  await page
    .getByRole("button", { name: "Publish to website", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Describe the image");
  await page
    .getByLabel("Image description", { exact: true })
    .fill("Arka brand identity");
  await publish(page);
  const web = await publicPage(context);
  const img = web.locator("#mm-work").getByAltText("Arka brand identity");
  await expect(img).toBeVisible();
  await expect
    .poll(() => img.evaluate((i) => i.naturalWidth))
    .toBeGreaterThan(0);
  const src = await img.getAttribute("src");
  expect((await web.request.get(src)).headers()["content-type"]).toBe(
    "image/png",
  );
  await page
    .getByRole("button", { name: "Edit Arka campaign", exact: true })
    .click();
  await page.getByRole("button", { name: "2 Media" }).click();
  await page
    .getByLabel("Upload image", { exact: true })
    .setInputFiles({
      name: "large.png",
      mimeType: "image/png",
      buffer: Buffer.alloc(4 * 1024 * 1024 + 1),
    });
  await expect(page.getByRole("alert")).toContainText("4 MB");
});

test("client stories support text, image, video and real switching", async ({
  page,
  context,
}) => {
  await login(page);
  await section(page, "Client stories");
  await add(page, "story", "Asha Rao", "We loved the campaign.");
  await publish(page);
  await expect(
    page.getByRole("heading", { name: "Client stories", exact: true }),
  ).toBeVisible();
  await add(page, "story", "Ravi Mehta", "Our new identity feels right.");
  await page.getByRole("button", { name: "2 Media" }).click();
  await page.getByRole("radio", { name: /Image/ }).check();
  await page
    .getByLabel("Upload image", { exact: true })
    .setInputFiles("public/clients/arka.png");
  await expect(page.getByLabel("Image URL", { exact: true })).toHaveValue(
    /api\/media/,
  );
  await page
    .getByLabel("Image description", { exact: true })
    .fill("Ravi’s brand identity");
  await publish(page);
  await add(page, "story", "Video client", "Watch our story.");
  await page.getByRole("button", { name: "2 Media" }).click();
  await page.getByRole("radio", { name: /Video/ }).check();
  await page
    .getByLabel("Video URL", { exact: true })
    .fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await publish(page);
  const web = await publicPage(context);
  await web
    .locator("#mm-stories")
    .getByRole("button", { name: "Asha Rao", exact: true })
    .click();
  await expect(web.locator("blockquote")).toContainText(
    "We loved the campaign.",
  );
  await web.getByRole("button", { name: "Ravi Mehta", exact: true }).click();
  await expect(web.getByAltText("Ravi’s brand identity")).toBeVisible();
  await web.getByRole("button", { name: "Video client", exact: true }).click();
  await web
    .getByRole("button", { name: "Play Video client", exact: true })
    .click();
  await expect(web.locator("#mm-stories iframe")).toHaveAttribute(
    "src",
    /youtube-nocookie.com\/embed\/dQw4w9WgXcQ/,
  );
});

test("uploaded video actually plays, supports seeking ranges, and survives reload", async ({
  page,
  context,
}) => {
  await login(page);
  await add(page, "work", "A real studio film");
  await page.getByRole("button", { name: "2 Media" }).click();
  await page.getByRole("radio", { name: /Video/ }).check();
  await page
    .getByLabel("Upload short video", { exact: true })
    .setInputFiles("tests/fixtures/sample.mp4");
  await expect(page.getByLabel("Video URL", { exact: true })).toHaveValue(
    /api\/media/,
  );
  await publish(page);
  const web = await publicPage(context);
  const video = web.getByLabel("A real studio film", { exact: true });
  await expect(video).toBeVisible();
  await video.evaluate((v) => v.play());
  await expect
    .poll(() => video.evaluate((v) => v.currentTime))
    .toBeGreaterThan(0.1);
  const src = await video.getAttribute("src");
  const range = await web.request.get(src, {
    headers: { Range: "bytes=0-99" },
  });
  expect(range.status()).toBe(206);
  expect((await range.body()).length).toBe(100);
  expect(
    (
      await web.request.get(src, { headers: { Range: "bytes=99999999-" } })
    ).status(),
  ).toBe(416);
  await web.reload();
  await expect(
    web.getByLabel("A real studio film", { exact: true }),
  ).toHaveAttribute("src", src);
});

test("brands text/image/video CRUD and website ordering", async ({
  page,
  context,
}) => {
  await login(page);
  await section(page, "Brands we’ve helped bloom");
  await add(page, "brand", "Bloom partner", "Growing together.");
  await publish(page);
  await page
    .getByRole("button", { name: "Move Bloom partner up", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("order updated");
  const web = await publicPage(context);
  await expect(
    web.getByRole("heading", { name: "Bloom partner", exact: true }),
  ).toBeVisible();
  await expect(web.locator(".mm-brand h3")).toHaveText([
    "WingWise Aviation Academy",
    "Ray Design Studios",
    "Bloom partner",
    "Arka",
  ]);
  await page
    .getByRole("button", { name: "Edit Bloom partner", exact: true })
    .click();
  await page.getByRole("button", { name: "2 Media" }).click();
  await page.getByRole("radio", { name: /Image/ }).check();
  await page
    .getByLabel("Upload image", { exact: true })
    .setInputFiles("public/clients/arka.png");
  await expect(page.getByLabel("Image URL", { exact: true })).toHaveValue(
    /api\/media/,
  );
  await page
    .getByLabel("Image description", { exact: true })
    .fill("Bloom logo");
  await review(page);
  await page
    .getByRole("button", { name: "Publish changes", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("published");
  await web.reload();
  await expect(web.getByAltText("Bloom logo")).toBeVisible();
  await page
    .getByRole("button", { name: "Edit Bloom partner", exact: true })
    .click();
  await page.getByRole("button", { name: "2 Media" }).click();
  await page.getByRole("radio", { name: /Video/ }).check();
  await page
    .getByLabel("Video URL", { exact: true })
    .fill("https://vimeo.com/76979871");
  await review(page);
  await page
    .getByRole("button", { name: "Publish changes", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("published");
  await web.reload();
  await web
    .getByRole("button", { name: "Play Bloom partner", exact: true })
    .click();
  await expect(web.locator(".mm-brand iframe")).toHaveAttribute(
    "src",
    /player.vimeo.com\/video\/76979871/,
  );
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Delete Bloom partner", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("deleted");
  await web.reload();
  await expect(
    web.getByRole("heading", { name: "Bloom partner", exact: true }),
  ).toHaveCount(0);
});

test("search, filters, unsaved confirmation and mobile editor UX", async ({
  page,
}) => {
  await login(page);
  await page.screenshot({
    path: "artifacts/admin-desktop.png",
    fullPage: true,
  });
  await page.getByLabel("Search items").fill("Vaidya");
  await expect(page.locator(".ma-item")).toHaveCount(1);
  await page.getByLabel("Filter by status").selectOption("published");
  await expect(
    page.getByRole("heading", { name: "No matching items" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await add(page, "work", "Unsaved");
  page.once("dialog", (d) => d.dismiss());
  await section(page, "Client stories");
  await expect(page.getByLabel("Project title", { exact: true })).toHaveValue(
    "Unsaved",
  );
  page.once("dialog", (d) => d.accept());
  await section(page, "Client stories");
  await expect(
    page.getByRole("heading", { name: "Client stories", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await add(page, "story", "Mobile client", "A lovely team to work with.");
  await page.getByRole("button", { name: "2 Media" }).click();
  await page.screenshot({
    path: "artifacts/admin-mobile-editor.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Continue", exact: false }),
  ).toBeInViewport();
  await publish(page);
  await page.screenshot({ path: "artifacts/admin-mobile.png", fullPage: true });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("stale editor and failed saves never claim published or redirect sections", async ({
  page,
  context,
}) => {
  await login(page);
  await add(page, "work", "Conflict draft");
  const other = await context.request.get("/api/admin/content");
  const current = await other.json();
  await context.request.put("/api/admin/content", {
    headers: { Origin: origin },
    data: {
      section: "brands",
      revision: current.revision,
      item: item("Concurrent brand"),
    },
  });
  await review(page);
  await page
    .getByRole("button", { name: "Publish to website", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("another tab");
  await expect(
    page.getByRole("button", { name: "Publish to website", exact: true }),
  ).toBeVisible();
  const pub = await (await context.request.get("/api/content")).json();
  expect(pub.work.some((w) => w.title === "Conflict draft")).toBe(false);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reload latest" }).click();
  await expect(
    page.getByRole("heading", { name: "Featured work", exact: true }),
  ).toBeVisible();
  await add(page, "work", "Network failure");
  await page.route("**/api/admin/content", (route) =>
    route.request().method() === "PUT"
      ? route.fulfill({
          status: 503,
          json: { error: "Simulated database outage" },
        })
      : route.continue(),
  );
  await review(page);
  await page
    .getByRole("button", { name: "Publish to website", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Simulated database outage",
  );
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("API validation, CSRF, draft privacy, upload protections and login rate limit", async ({
  request,
}) => {
  for (const method of ["put", "patch", "delete"])
    expect(
      (
        await request[method]("/api/admin/content", {
          headers: { Origin: origin },
          data: {},
        })
      ).status(),
    ).toBe(401);
  expect(
    (
      await request.post("/api/admin/uploads", {
        headers: { Origin: origin, "Content-Type": "image/png" },
        data: fs.readFileSync("public/clients/arka.png"),
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.post("/api/admin/login", {
        headers: { Origin: "https://evil.example" },
        data: credentials,
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/admin/login", {
        headers: { Origin: origin },
        data: credentials,
      })
    ).status(),
  ).toBe(200);
  const content = await (await request.get("/api/admin/content")).json();
  expect(
    (
      await request.put("/api/admin/content", {
        headers: { Origin: "https://evil.example" },
        data: {
          section: "work",
          revision: content.revision,
          item: item("CSRF"),
        },
      })
    ).status(),
  ).toBe(403);
  for (const bad of [
    item("Bad video", { kind: "video", mediaUrl: "javascript:alert(1)" }),
    item("Missing image", { kind: "image" }),
    item("XSS link", { link: "javascript:alert(1)" }),
    item("Unknown upload", {
      kind: "image",
      mediaUrl: "/api/media?id=000000000000000000000000",
      alt: "Photo",
    }),
  ]) {
    expect(
      (
        await request.put("/api/admin/content", {
          headers: { Origin: origin },
          data: { section: "work", revision: content.revision, item: bad },
        })
      ).status(),
    ).toBe(400);
  }
  const saved = await request.put("/api/admin/content", {
    headers: { Origin: origin },
    data: {
      section: "work",
      revision: content.revision,
      item: item("Private draft", { status: "draft", kind: "video" }),
    },
  });
  expect(saved.status()).toBe(200);
  expect(
    JSON.stringify(await (await request.get("/api/content")).json()),
  ).not.toContain("Private draft");
  expect(
    (
      await request.post("/api/admin/uploads", {
        headers: { Origin: origin, "Content-Type": "image/png" },
        data: Buffer.from("<script>fake image</script>"),
      })
    ).status(),
  ).toBe(415);
  expect(
    (
      await request.post("/api/admin/uploads", {
        headers: { Origin: origin, "Content-Type": "image/png" },
        data: Buffer.alloc(4 * 1024 * 1024 + 1),
      })
    ).status(),
  ).toBe(413);
  for (let i = 0; i < 9; i++)
    expect(
      (
        await request.post("/api/admin/login", {
          headers: { Origin: origin },
          data: { ...credentials, password: "wrong" },
        })
      ).status(),
    ).toBe(401);
  expect(
    (
      await request.post("/api/admin/login", {
        headers: { Origin: origin },
        data: credentials,
      })
    ).status(),
  ).toBe(429);
});

test("public content reveals after fetching, drag scrolling works, and mobile stays within viewport", async ({
  page,
  request,
}) => {
  await request.post("/api/admin/login", {
    headers: { Origin: origin },
    data: credentials,
  });
  let content = await (await request.get("/api/admin/content")).json();
  for (let i = 0; i < 5; i++)
    content = await (
      await request.put("/api/admin/content", {
        headers: { Origin: origin },
        data: {
          section: "work",
          revision: content.revision,
          item: item(`Scroll project ${i}`),
        },
      })
    ).json();
  await page.goto("/");
  await page.locator("#mm-work").scrollIntoViewIfNeeded();
  await expect(page.locator(".mm-work__head")).toHaveClass(/is-visible/);
  await expect(page.locator("#mm-work .mm-work__strip article")).toHaveCount(5);
  const strip = page.locator(".mm-work__strip");
  const bounds = await strip.boundingBox();
  await page.mouse.move(bounds.x + 600, bounds.y + 180);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 100, bounds.y + 180, { steps: 12 });
  await page.mouse.up();
  await expect
    .poll(() => strip.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(100);
  await page.locator("#mm-stories").scrollIntoViewIfNeeded();
  await expect(page.locator(".mm-stories__head")).toHaveClass(/is-visible/);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({
    path: "artifacts/public-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
