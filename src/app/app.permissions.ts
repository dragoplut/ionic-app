/**
 * Role permission rules for users.
 * Structure [role][entity][action/item][boolean]
 */
export const PERMISSION_RULES = {
  admin: {
    settings: {
      view: true
    },
    signin: {
      view: true
    },
    admin: {
      create: false,
      delete: false,
      edit: true,
      role: false,
      status: false,
      password: true,
      view: true
    },
    super: {
      create: false,
      delete: false,
      edit: false,
      role: false,
      status: false,
      password: false,
      view: true
    },
    user: {
      create: true,
      delete: true,
      edit: true,
      role: true,
      status: true,
      password: true,
      view: true
    },
    equipmed: {
      create: true,
      delete: true,
      edit: true,
      role: true,
      status: true,
      password: true,
      view: true
    },
    manufacturer: {
      create: true,
      delete: true,
      edit: true,
      role: true,
      status: true,
      password: true,
      view: true
    },
    distributor: {
      create: true,
      delete: true,
      edit: true,
      role: true,
      status: true,
      password: true,
      view: true
    },
    distribution: {
      create: true,
      delete: true,
      edit: true,
      view: false
    }
  },
  super: {
    settings: {
      view: true
    },
    signin: {
      view: true
    },
    admin: {
      create: true,
      delete: true,
      edit: true,
      role: true,
      status: true,
      password: true,
      view: true
    },
    super: {
      create: false,
      delete: false,
      edit: true,
      role: false,
      status: false,
      password: true,
      view: true
    },
    user: {
      create: true,
      delete: true,
      edit: true,
      role: true,
      status: true,
      password: true,
      view: true
    },
    equipmed: {
      create: true,
      delete: true,
      edit: true,
      role: true,
      status: true,
      password: true,
      view: true
    },
    manufacturer: {
      create: true,
      delete: true,
      edit: true,
      role: true,
      status: true,
      password: true,
      view: true
    },
    distributor: {
      create: true,
      delete: true,
      edit: true,
      role: true,
      status: true,
      password: true,
      view: true
    },
    firmware: {
      create: true,
      delete: true,
      edit: true,
      view: true
    },
    reporting: {
      create: true,
      delete: true,
      edit: true,
      view: true
    },
    distribution: {
      create: true,
      delete: true,
      edit: true,
      view: true
    },
    whitelist: {
      create: true,
      delete: true,
      edit: true,
      view: true
    },
    returns: {
      create: true,
      delete: true,
      edit: true,
      view: true
    },
    customers: {
      create: true,
      delete: true,
      edit: true,
      view: true
    }
  },
  user: {
    settings: {
      view: false
    },
    signin: {
      view: false
    },
    user: {
      create: false,
      delete: false,
      edit: false,
      role: false,
      status: false,
      password: false,
      view: false
    }
  },
  equipmed: {
    signin: {
      view: true
    },
    equipmed: {
      edit: true,
      password: true
    },
    firmware: {
      create: true,
      delete: true,
      edit: true,
      view: true
    },
    reporting: {
      create: true,
      delete: true,
      edit: true,
      view: true
    },
    distributor: {
      create: true,
      edit: true,
      view: true
    },
    distribution: {
      create: true,
      delete: true,
      edit: true,
      view: true
    },
    whitelist: {
      create: true,
      delete: true,
      edit: true,
      view: true
    }
  },
  manufacturer: {
    signin: {
      view: true
    },
    manufacturer: {
      view: false,
      edit: true,
      password: true
    },
    returns: {
      create: true,
      delete: true,
      edit: true,
      view: true
    }
  },
  distributor: {
    signin: {
      view: true
    },
    distributor: {
      edit: true,
      password: true,
      view: false
    },
    customers: {
      create: true,
      delete: true,
      edit: true,
      view: true
    }
  }
};
