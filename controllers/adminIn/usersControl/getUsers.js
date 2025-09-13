// Controller to get users with filtering, pagination, sorting, and excluding sensitive fields
const User = require("../../../models/User");

const getUsers = async (req, res) => {
  try {
    const {
      search,
      role,
      isVerified,
      createdFrom,
      createdTo,
      sort = "createdAt", // default sort field
      order = "desc", // default sort order
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Search filter (name, email, phone)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Role filter
    if (role) query.role = role;

    // Verified filter
    if (isVerified !== undefined) {
      query.isVerified = isVerified === "true";
    }

    // Date range filter
    if (createdFrom || createdTo) {
      query.createdAt = {};
      if (createdFrom) query.createdAt.$gte = new Date(createdFrom);
      if (createdTo) query.createdAt.$lte = new Date(createdTo);
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sort] = order === "asc" ? 1 : -1;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Exclude sensitive fields
    const users = await User.find(query)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .skip(skip)
      .limit(Number(limit))
      .sort(sortOptions);

    const totalUsers = await User.countDocuments(query);

    return res.status(200).json({
      status: 200,
      data: {
        totalUsers,
        currentPage: Number(page),
        totalPages: Math.ceil(totalUsers / limit),
        users,
        message: "Users retrieved successfully",
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = getUsers;
