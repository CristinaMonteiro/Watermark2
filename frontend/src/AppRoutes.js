import React from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";

import Login from "./pages/login";
import Homepage from "./pages/homepage";
import UploadDocument from "./pages/UploadDocument";
import VerifyDocument from "./pages/verifyDocument";
import RecoverPasswordSendEmail from "./pages/sendEmail";
import RedefinePassword from "./pages/redefinirPassword";
import Error404 from "./pages/ErrorPages/error404";
import Error403 from "./pages/ErrorPages/error403";
import Error500 from "./pages/ErrorPages/error500";




const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/homepage" element={<Homepage />} />
                <Route path="/upload" element={<UploadDocument />} />
                <Route path="/verify" element={<VerifyDocument />} />
                <Route path="/recover-password" element={<RecoverPasswordSendEmail />} />
                <Route path="/redefine-password" element={<RedefinePassword />} />

                {/*Rotas para as paginas nao encontradas - 404, 403, 500*/}
                <Route path="*" element={<Error404 />} />
                <Route path="/403" element={<Error403 />} />
                <Route path="/500" element={<Error500 />} />

            </Routes>
            
        </BrowserRouter>
    );
}
export default AppRoutes;
