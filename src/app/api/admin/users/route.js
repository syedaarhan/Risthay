import { ok, fail, serverError, readJson } from "@/lib/server/http";
import { getAdminSession, hasPermission } from "@/lib/server/adminAuth";
import {
  getAdminUsersList,
  createNewAdminUser,
  updateAdminUserStatus
} from "@/lib/server/adminRepo";

export async function GET(request) {
  try {
    const admin = getAdminSession(request);
    if (!admin) {
      return fail("Unauthorized access. Administrator login required.", 401);
    }

    if (!hasPermission(admin.role, "manage_admin_users") && admin.role !== "super_admin") {
      return fail("Forbidden: Only Super Administrators can view the admin user roster.", 403);
    }

    const adminUsers = getAdminUsersList();
    return ok({ adminUsers });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request) {
  try {
    const admin = getAdminSession(request);
    if (!admin || admin.role !== "super_admin") {
      return fail("Forbidden: Only Super Administrators can add new admin accounts.", 403);
    }

    const body = await readJson(request);
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return fail("Email, password, and full name are required.", 400);
    }

    const created = createNewAdminUser({ email, password, name, role }, admin);
    return ok({ message: "Admin account successfully created.", admin: created });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request) {
  try {
    const admin = getAdminSession(request);
    if (!admin || admin.role !== "super_admin") {
      return fail("Forbidden: Only Super Administrators can modify admin accounts.", 403);
    }

    const body = await readJson(request);
    const { id, role, active } = body;

    if (!id) {
      return fail("Admin user ID is required.", 400);
    }

    if (id === admin.id && active === false) {
      return fail("Cannot deactivate your own administrator account.", 400);
    }

    const result = updateAdminUserStatus(id, { role, active }, admin);
    return ok({ message: "Admin account updated.", ...result });
  } catch (error) {
    return serverError(error);
  }
}
